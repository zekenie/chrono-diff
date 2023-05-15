#!/usr/bin/env zx

import lodash from "lodash";

const { data, charts } = await fs.readJSON("search-over-time-summary.json");

const dataGroupedByName = lodash.groupBy(data, "searchName");

for (const chart of charts) {
  const shouldMatchAll =
    chart.searches.length === 1 && chart.searches[0] === "*";
  const searchResults = shouldMatchAll
    ? data
    : chart.searches.map((searchName) => dataGroupedByName[searchName]).flat();
  const spec = createSpec(searchResults, chart);
  await $`mkdir -p charts`;
  await fs.writeJSON(`charts/${chart.name}.json`, spec);
  await $`vl-convert vl2svg -i charts/${chart.name}.json -o charts/${chart.name}.svg --vl-version 5.5`;
}

function createSpec(searches, chart) {
  switch (chart.type) {
    case "matrix":
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        title: chart.name,
        width: 400,
        height: 300,
        data: { values: searches },
        mark: {
          type: "rect",
          width: 40, // Adjust the width of the boxes
          height: 40, // Adjust the height of the boxes
        },
        config: {
          view: { stroke: null },
          scale: { bandPaddingInner: 0.2 },
        },
        encoding: {
          x: {
            field: "date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            bin: true,
            spacing: 0,
          },
          y: { field: "searchName", type: "ordinal", spacing: 0 },
          color: { field: "lines", type: "quantitative", aggregate: "average" },
        },
      };
    case "line":
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        title: chart.name,
        width: 400,
        height: 300,
        data: { values: searches },
        mark: "line",
        encoding: {
          x: { field: "date", type: "temporal" },
          y: { field: "lines", type: "quantitative" },
          color: { field: "searchName", type: "nominal" },
        },
      };
  }
}
