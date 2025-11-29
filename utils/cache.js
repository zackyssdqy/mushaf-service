import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 5 }); // cache 5 menit

export default cache;
