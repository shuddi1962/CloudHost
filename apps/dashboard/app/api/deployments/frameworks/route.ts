import { NextResponse } from "next/server";

const frameworks = [
  {
    id: "custom",
    name: "Custom",
    build_command: null,
    install_command: null,
    output_directory: null,
  },
  {
    id: "nextjs",
    name: "Next.js",
    build_command: "npm run build",
    install_command: "npm install",
    output_directory: ".next",
  },
  {
    id: "react",
    name: "React",
    build_command: "npm run build",
    install_command: "npm install",
    output_directory: "build",
  },
  {
    id: "vue",
    name: "Vue.js",
    build_command: "npm run build",
    install_command: "npm install",
    output_directory: "dist",
  },
  {
    id: "nuxt",
    name: "Nuxt.js",
    build_command: "npm run build",
    install_command: "npm install",
    output_directory: ".output",
  },
  {
    id: "svelte",
    name: "Svelte",
    build_command: "npm run build",
    install_command: "npm install",
    output_directory: "public",
  },
  {
    id: "angular",
    name: "Angular",
    build_command: "npm run build --prod",
    install_command: "npm install",
    output_directory: "dist",
  },
  {
    id: "express",
    name: "Express",
    build_command: null,
    install_command: "npm install",
    output_directory: null,
  },
  {
    id: "django",
    name: "Django",
    build_command: null,
    install_command: "pip install -r requirements.txt",
    output_directory: null,
  },
  {
    id: "flask",
    name: "Flask",
    build_command: null,
    install_command: "pip install -r requirements.txt",
    output_directory: null,
  },
  {
    id: "laravel",
    name: "Laravel",
    build_command: null,
    install_command: "composer install",
    output_directory: null,
  },
  {
    id: "wordpress",
    name: "WordPress",
    build_command: null,
    install_command: null,
    output_directory: null,
  },
  {
    id: "static",
    name: "Static",
    build_command: null,
    install_command: null,
    output_directory: null,
  },
  {
    id: "node",
    name: "Node.js",
    build_command: null,
    install_command: "npm install",
    output_directory: null,
  },
  {
    id: "php",
    name: "PHP",
    build_command: null,
    install_command: "composer install",
    output_directory: null,
  },
];

export async function GET() {
  return NextResponse.json(frameworks);
}
