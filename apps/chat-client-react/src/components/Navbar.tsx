import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav>
      <div className="sticky top-0 z-40 flex justify-between items-center py-1.5 mt-2.5">
        <a href="/">
          <h1 className="font-semibold text-lg">
            <span role="img" aria-label="eight-pointed star">
              ✴️
            </span>{" "}
            Astra AI
          </h1>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
