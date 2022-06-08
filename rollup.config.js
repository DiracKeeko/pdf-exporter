import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

const isProduction = process.env.NODE_ENV === "production";

const plugins = [resolve(), commonjs(), typescript(), isProduction && terser()];

const bundleOutputOptions = {
  input: "src/pdf-exporter.ts",
  output: {
    dir: "dist",
    format: "esm",
    exports: "default",
    name: "pdfExporter",
  },
  plugins,
};

export default [bundleOutputOptions];
