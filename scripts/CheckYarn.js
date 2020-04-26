if (!/yarn\.js$/.test(process.env.npm_execpath || "")) {
  console.warn("\u001b[33mYarn is required to build EveVision.\u001b[39m");
}
