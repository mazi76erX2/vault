import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, logout, setRoles } from "@/store/slices/authSlice";
import { LoginRequestDTO } from "@/types/dtos/LoginResponseDTO";

export const useAuthContext = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    login: (loginData: LoginRequestDTO) => dispatch(login(loginData)).unwrap(),
    logout: () => dispatch(logout()),
    setUserRoles: (roles: string[]) => dispatch(setRoles(roles)),
  };
};
