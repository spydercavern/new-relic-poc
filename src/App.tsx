import { useEffect, useState } from "react";
import "./App.css";
import data from "./data.json";

import { init as initApm } from "@elastic/apm-rum";
export const apm = initApm({
  serviceName: "fsg-ui-app",
  serverUrl:
    "https://708ad4887d4544a492efcb1aed995d37.apm.us-central1.gcp.cloud.es.io:443",
  serviceVersion: "",
  environment: "development",
  logLevel: "debug",
});
apm.addFilter(function (payload) {
  console.log(`payload data ${JSON.stringify(payload)}`);
  return payload;
});

const helpfulComparator = (a, b) => b.reviewHelpful - a.reviewHelpful;
const startsComparator = (a, b) => b.reviewStars - a.reviewStars;

function App() {
  const [sort, setSort] = useState("");
  const reviews = data.productReviews.reviews;

  if (sort === "helpful") reviews.sort(helpfulComparator);
  else if (sort === "starts") reviews.sort(startsComparator);
  else console.log("nothing to sort by, defaulting to helpful sort by default");

  const apmTracker = (
    eventName: string,
    subEventName: string,
  ) => {
    const id = Math.floor(Math.random() * 1000);
    apm.setUserContext({
      email: `abc-${id}@def.com`,
      username: `abc-${id}`,
      id: id,
    });
    apm?.addLabels({
      eventName,
      subEventName,
      clickedAt: new Date().toISOString(),
      appName: "hub-ops",
    });
    const transaction = apm.startTransaction(eventName, null, {
      canReuse: false,
      managed: true,
    });

    const span = transaction?.startSpan(subEventName);

    setTimeout(() => {
      span?.end();
      transaction?.end();
    }, 0);
  };

  const handleSort = (param: string) => {
    apmTracker("ZeroClicks", param, {
      userId: 1231,
    });
    setSort(param);
  };

  const handleSomethingElse = () => {
    apmTracker("MyData", `rand_${Math.random()}`, {
      userId: 2222,
    });
  };

  return (
    <>
      <button onClick={() => handleSort("helpful")}> helpful</button>
      <button onClick={() => handleSort("starts")}> starts</button>
      <button onClick={() => handleSomethingElse()}>click</button>
      {reviews.map((review) => (
        <div key={review.id}>
          <h3>Name: {review.reviewerName}</h3>
          <p>Stars:{review.reviewStars}</p>
          <p>helpfulCount: {review.reviewHelpful}</p>
        </div>
      ))}
    </>
  );
}

export default App;
