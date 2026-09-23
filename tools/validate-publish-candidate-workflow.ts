import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const workflow = fs.readFileSync(
  path.join(process.cwd(), ".github", "workflows", "publish-candidate.yml"),
  "utf8",
);

assert.match(workflow, /^\s*workflow_dispatch:/m, "candidate workflow must be manually dispatched");
assert.doesNotMatch(workflow, /^\s*push:/m, "candidate workflow must not run on pushes");
assert.match(workflow, /contents: write/, "candidate workflow must be able to create a prerelease");
assert.match(workflow, /runs-on: ubuntu-latest/, "candidate archive must be built on Ubuntu");
assert.match(workflow, /node-version: "20\.x"/, "candidate archive must use Node 20");
assert.match(
  workflow,
  /github\.ref == 'refs\/heads\/main'/,
  "candidate workflow must reject a dispatch outside main",
);
assert.match(
  workflow,
  /git merge-base --is-ancestor "\$GITHUB_SHA" origin\/main/,
  "candidate workflow must bind the archive to a main ancestor",
);
assert.match(workflow, /candidate tag must be vX\.Y\.Z-rc\.N/, "candidate tag must be an RC");
assert.match(workflow, /candidate tag does not match/, "candidate tag must match package version");
assert.match(
  workflow,
  /release:verify-provider/,
  "candidate workflow must verify its provider contract",
);
assert.match(
  workflow,
  /release:prepare -- --output candidate/,
  "candidate workflow must produce its own archive",
);
assert.match(
  workflow,
  /--draft --prerelease --verify-tag/,
  "candidate release must remain draft until its assets are uploaded",
);
assert.match(
  workflow,
  /gh release edit "\$RELEASE_TAG" --draft=false --prerelease/,
  "candidate workflow must publish its prepared draft",
);
assert.ok(
  workflow.indexOf("gh release upload") <
    workflow.indexOf('gh release edit "$RELEASE_TAG" --draft=false --prerelease'),
  "candidate assets must upload before the release becomes immutable",
);
assert.match(
  workflow,
  /git tag -a "\$RELEASE_TAG" "\$GITHUB_SHA"/,
  "candidate workflow must create its tag before creating a draft release",
);
assert.match(
  workflow,
  /git push origin "refs\/tags\/\$RELEASE_TAG"/,
  "candidate workflow must publish the exact candidate tag",
);
assert.match(
  workflow,
  /--verify-tag/,
  "candidate draft must attach to the previously verified tag",
);
assert.ok(
  workflow.indexOf("git tag -a") < workflow.indexOf("gh release create"),
  "candidate tag must exist before creating its draft release",
);
assert.match(workflow, /\.assets \| length/, "candidate workflow must verify asset count");
assert.match(
  workflow,
  /sha256:\$\{\{ steps\.candidate\.outputs\.sha \}\}/,
  "candidate workflow must verify archive digest",
);
assert.match(workflow, /immutable/, "candidate workflow must verify release immutability");

console.log("✓ candidate workflow structural contract passed");
