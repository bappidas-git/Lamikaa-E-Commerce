import { useEffect } from "react";
import { adminThemeMode } from "../theme/adminTheme";

// Marks <body> with .admin-area while any admin screen is mounted, so global
// CSS that lives outside the MUI tree (SweetAlert2 popups, page scrollbars, the
// overscroll ground) can follow the flat admin design language instead of the
// storefront one — and with .admin-light while the admin is in its light mode,
// because those same surfaces have to follow the MODE as well as the product.
//
// Ref-counted because AdminLogin and AdminLayout can overlap during the
// login → dashboard route swap; a plain add/remove pair could strip the
// class right after the other screen added it. The MODE is not ref-counted: it
// comes from one provider above both screens, so both callers are always
// passing the same answer.
let mountedAdminScreens = 0;

/**
 * @param {"dark"|"light"} [mode]  the admin theme mode; defaults to dark
 */
const useAdminBodyClass = (mode) => {
  const resolved = adminThemeMode(mode);

  useEffect(() => {
    mountedAdminScreens += 1;
    document.body.classList.add("admin-area");
    return () => {
      mountedAdminScreens -= 1;
      if (mountedAdminScreens <= 0) {
        document.body.classList.remove("admin-area");
        document.body.classList.remove("admin-light");
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("admin-light", resolved === "light");
  }, [resolved]);
};

export default useAdminBodyClass;
