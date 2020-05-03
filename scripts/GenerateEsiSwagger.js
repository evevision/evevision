import { CodeGen } from "swagger-typescript-codegen";
import superagent from "superagent";
import fs from "fs";

superagent
  .get("https://esi.evetech.net/latest/swagger.json")
  .end((err, res) => {
    const tsSourceCode = CodeGen.getTypescriptCode({
      className: "Esi",
      swagger: res.body,
    });
    fs.writeFile("app/esi/esi.ts", tsSourceCode, function (err) {
      if (err) {
        console.error("Error writing swagger files!", err);
      }
    });
  });
