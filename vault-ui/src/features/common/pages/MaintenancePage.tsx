import React from "react";

const MaintenancePage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center max-w-4xl mx-auto">
    <h1 className="text-4xl font-bold text-foreground">
      Oops!
      <br />
      Under Maintenance
    </h1>
    <p className="text-xl text-muted-foreground mt-4 max-w-lg">
      We're working hard to bring you something amazing. Please check back
      later!
    </p>
  </div>
);

export default MaintenancePage;
