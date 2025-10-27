import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonDetail from './pages/LessonDetail';
import CanvasCoding from './pages/CanvasCoding';
import ImageRecognition from './pages/ImageRecognition';
import MyProjects from './pages/MyProjects';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

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
        path: 'my-projects',
        element: <MyProjects />,
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
]);
