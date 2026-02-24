import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './screens/Home';
import WorkoutLog from './screens/WorkoutLog';
import History from './screens/History';
import Progress from './screens/Progress';
import BottomNav from './components/BottomNav';

function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname === '/workout';

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4FF00]/30 selection:text-[#D4FF00]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<WorkoutLog />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
