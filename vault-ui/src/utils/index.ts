export const isEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const isWebsite = (website: string) => {
  const WEB_REGEXP = new RegExp(
    "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?",
  );
  return WEB_REGEXP.test(website);
};

export const getSearchQueryData = () => {
  const search = window.location.search.replace("?", "").split("&");
  const data: Record<string, unknown> = {};
  search.forEach((s) => {
    const [key, value] = s.split("=");
    data[key] = value;
  });
  return data;
};

export const convertSize = (
  size: number,
  from: "px" | "pt" | "pc" | "in" | "cm" | "mm",
  to: "px" | "pt" | "pc" | "in" | "cm" | "mm",
) => {
  const sizes = {
    px: 1,
    pt: 96 / 72,
    pc: 16,
    in: 96,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
  };

  const convertedValue = ((size * sizes[from]) / sizes[to]).toFixed(2);

  const parts = convertedValue.split(".");

  return parts[1] === "00" ? parts[0] : `${parts[0]}.${parts[1]}`;
};

export const drawerWidth = 300;
