import dynamic from "next/dynamic";
export default dynamic(() => import("./content"), { ssr: false });
