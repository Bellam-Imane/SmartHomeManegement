import bgLogin from '../assets/backgorund-login.jpeg';

const AuthSidebar = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 h-screen relative">
      {/* Image de fond */}
      <img 
        src={bgLogin}
        alt="SmartHome" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay avec alignement au centre */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center px-10 text-white z-10 text-center">
        <h1 className="text-6xl font-bold mb-4 tracking-tight">SmartHome</h1>
        <p className="text-xl opacity-90 max-w-md">
          Gérez votre maison avec intelligence.
        </p>
      </div>
    </div>
  );
};
export default AuthSidebar;