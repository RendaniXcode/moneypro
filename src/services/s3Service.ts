import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize the S3 client
const s3Client = new S3Client({
    region: import.meta.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    }
});

// Log configuration details in development mode
if (import.meta.env.DEV) {
    console.log('S3 Configuration:', {
        region: import.meta.env.VITE_AWS_REGION,
        bucket: import.meta.env.VITE_S3_BUCKET,
        folder: import.meta.env.VITE_S3_FOLDER
    });
}

/**
 * Upload a file to S3 using pre-signed URL approach
 * @param file The file to upload
 * @param onProgress Optional callback for progress updates (simulated)
 * @returns Promise resolving to the file URL
 */
export const uploadToS3 = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> => {
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const folder = import.meta.env.VITE_S3_FOLDER || '';

    if (!bucket) {
        throw new Error('S3 bucket not configured. Please check VITE_S3_BUCKET environment variable.');
    }

    // Check file size limit (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum limit of 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Create a unique filename to avoid collisions
    const fileName = `${folder ? `${folder}/` : ''}${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    try {
        // Log file info
        if (import.meta.env.DEV) {
            console.log('File upload info:', {
                name: file.name,
                size: file.size,
                type: file.type,
                sizeInMB: file.size ? (file.size / (1024 * 1024)).toFixed(2) : 'unknown'
            });
        }

        // Start progress
        if (onProgress) {
            onProgress(10);
        }

        // Generate a pre-signed URL for PutObject operation
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            ContentType: file.type
        });

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour

        // Middle progress
        if (onProgress) {
            onProgress(30);
        }

        // Use fetch API to upload the file with the pre-signed URL
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        });

        if (!response.ok) {
            throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`);
        }

        // Complete progress
        if (onProgress) {
            onProgress(100);
        }

        if (import.meta.env.DEV) {
            console.log('S3 upload success for file:', file.name);
        }

        // Construct the permanent object URL
        const region = import.meta.env.VITE_AWS_REGION;
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

        return url;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

/**
 * Delete a file from S3
 * @param key The S3 object key to delete
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
    const bucket = import.meta.env.VITE_S3_BUCKET;

    if (!bucket) {
        throw new Error('S3 bucket not configured. Please check VITE_S3_BUCKET environment variable.');
    }

    const params = {
        Bucket: bucket,
        Key: key,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));

        if (import.meta.env.DEV) {
            console.log('S3 delete success:', key);
        }
    } catch (error) {
        console.error('S3 delete error:', error);
        throw error;
    }
};

/**
 * List objects in an S3 bucket/folder
 * @param prefix Optional folder prefix
 * @returns Array of S3 objects
 */
export const listS3Objects = async (prefix?: string) => {
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const folder = import.meta.env.VITE_S3_FOLDER || '';

    if (!bucket) {
        throw new Error('S3 bucket not configured. Please check VITE_S3_BUCKET environment variable.');
    }

    const params = {
        Bucket: bucket,
        Prefix: prefix || folder,
    };

    try {
        const data = await s3Client.send(new ListObjectsV2Command(params));
        return data.Contents || [];
    } catch (error) {
        console.error('S3 list objects error:', error);
        throw error;
    }
};

/**
 * Get the public URL for an S3 object
 * @param key The S3 object key
 * @returns The public URL for the object
 */
export const getS3ObjectUrl = (key: string): string => {
    const bucket = import.meta.env.VITE_S3_BUCKET;
    const region = import.meta.env.VITE_AWS_REGION;

    if (!bucket || !region) {
        throw new Error('S3 bucket or region not configured.');
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};