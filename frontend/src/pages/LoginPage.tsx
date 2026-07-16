import { Navigate } from 'react-router-dom';

/** 占位：当前进度 API 使用 default 用户，无需登录 */
export default function LoginPage() {
  return <Navigate to="/" replace />;
}
