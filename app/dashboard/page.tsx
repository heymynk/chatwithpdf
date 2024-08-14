export const dynamic = "force-dynamic"
import Documents from "@/components/Documents"


const Dashboard = () => {
  return (
    <div className="h-full max-w-7xl mx-auto">
        <h1 className="text-3xl p-5 bg-gray-100 font-extralight text-purple-600">
            My Documents
        </h1>

        {/* Documents */}
        <Documents/>

    </div>
  )
}

export default Dashboard
