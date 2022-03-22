import jsyaml from "js-yaml";
import { gres } from "../index.js";
import github from "./github.js";
import hexo from "./hexo.js";

const tester = async(req, db) => {
  const urlObj = new URL(req.url, "http://localhost");
  const q = (key) => {
    return urlObj.searchParams.get(key) || null;
  };
  switch (q("init")) {
    case "hexo":
      switch (q("action")) {
        case "auth_user":
          return gres(
            await github.user.auth({ token: q("token") }),
          );
          break;
        case "list_repo":
          return gres(
            await github.repo.list({
              token: q("token"),
              username: q("username"),
              org: Number(q("org")),
            }),
          );
        case "list_branches":
          return gres(
            await github.branch.list({
              token: q("token"),
              repo: q("repo"),
            }));
        case "get_file_info":
          return gres(
            await github.file.info({
              token: q("token"),
              repo: q("repo"),
              branch: q("branch"),
              path: q("path"),
              filename: q("filename"),
            }));
        case "test_hexo":
          return gres(
            await hexo.check({
              token: q("token"),
              repo: q("repo"),
              branch: q("branch"),
            }),
          );
        case "list_workflow":
          return gres(
            await github.workflow.list({
              token: q("token"),
              repo: q("repo"),
              branch: q("branch"),
            }),
          );
        case "reset_workflow":
          let wf = await github.workflow.download({
            token: q("token"),
            repo: q("repo"),
            branch: q("branch"),
            workflow: q("workflow"),
          });
          wf = jsyaml.load(wf);
          if (q("onlydispatch") === "true") {
            console.log("onlydispatch");
            wf.on = ["workflow_dispatch"];
          }
          else {
            if (!wf.on.includes("workflow_dispatch"))
              wf.on.push("workflow_dispatch");
          }
          wf = jsyaml.dump(wf);
          const up_wf = await github.workflow.upload({
            token: q("token"),
            repo: q("repo"),
            branch: q("branch"),
            workflow: q("workflow"),
            content: Buffer.from(wf).toString("base64"),

          });
          if (up_wf.ok) return gres({ ok: 1 });

          return gres({ ok: 1 });
      }
      break;
  }
};
export default tester;
