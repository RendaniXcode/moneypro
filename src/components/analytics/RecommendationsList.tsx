interface RecommendationsListProps {
  recommendations: string[];
}

const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Recommendations</h3>
      
      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
              {index + 1}
            </div>
            <div className="text-slate-600">{recommendation}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsList;
