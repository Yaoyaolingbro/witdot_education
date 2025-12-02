import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import CanvasCoding from './pages/CanvasCoding';
import ImageRecognition from './pages/ImageRecognition';
import VoiceAssistant from './pages/VoiceAssistant';
import Robot from './pages/Robot';
import MyProjects from './pages/MyProjects';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import AiVisionHome from './pages/AiVisionHome';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'courses/:courseId',
        element: <CourseDetail />,
      },
      {
        path: 'courses/:courseId/lessons/:lessonId',
        element: <LessonDetail />,
      },
      {
        path: 'canvas',
        element: <CanvasCoding />,
      },
      {
        path: 'canvas/image-recognition',
        element: <ImageRecognition />,
      },
      {
        path: 'canvas/voice-assistant',
        element: <VoiceAssistant />,
      },
      {
        path: 'canvas/robot',
        element: <Robot />,
      },
      {
        path: 'my-projects',
        element: <MyProjects />,
      },
      {
        path: 'ai-vision',
        element: <AiVisionHome />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'my-learning',
        element: <Profile />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
  // 小问同学对话页面 - 独立路由（不使用 Layout）
  {
    path: '/chat',
    element: <Chat />,
  },
]);
