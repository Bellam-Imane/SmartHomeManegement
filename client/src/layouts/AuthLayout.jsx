import AuthSidebar from '../components/AuthSidebar';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <AuthSidebar />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;