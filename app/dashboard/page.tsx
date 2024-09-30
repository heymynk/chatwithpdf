export const dynamic = "force-dynamic";
import Documents from "@/components/Documents";

const Dashboard = () => {
  return (
    <div className="h-full max-w-7xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl p-5 bg-gray-100 font-semibold text-purple-600 flex justify-center" >
        My Documents
      </h1>

      {/* Documents Component: Displays the user's documents */}
      <Documents />
    </div>
  );
};

export default Dashboard;
