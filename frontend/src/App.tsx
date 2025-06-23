import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import WeekPlanning from './pages/WeekPlanning';
import MealManagement from './pages/MealManagement';
import ShoppingList from './pages/ShoppingList';
import ShoppingListIndex from './pages/ShoppingListIndex';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<WeekPlanning />} />
            <Route path="meals/*" element={<MealManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="shopping-list" element={<ShoppingListIndex />} />
            <Route path="shopping-list/:date" element={<ShoppingList />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
