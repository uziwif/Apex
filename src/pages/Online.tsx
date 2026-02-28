import AnimatedBackground from '../components/AnimatedBackground'
import Sidebar from '../components/Sidebar'
import UnderConstruction from '../components/UnderConstruction'

export default function Online() {
  return (
    <div className="relative h-screen w-screen">
      <AnimatedBackground variant="app" />
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-2xl font-bold">Online</div>
          <UnderConstruction title="Online is coming soon." />
        </div>
      </div>
    </div>
  )
}
