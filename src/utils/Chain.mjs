import axios from "axios";

const Chain = async (data) => {
  const getChainData = () => {
    return axios
      .get("https://registry.cosmos.directory/" + data.name + "/chain")
      .then((res) => res.data);
  };

  const getTokenData = async () => {
    return axios
      .get("https://registry.cosmos.directory/" + data.name + "/assetlist")
      .then((res) => res.data);
  };

  const chainData = await getChainData();
  console.log("netowkr.json", data, "registry", chainData);
  const networksRpc = data.apis.rpc.map((el) => ({ address: el }));
  const tokenData = await getTokenData();
  const allRpc = networksRpc.concat(chainData.apis.rpc);
  const newChainData = {
    ...chainData,
    apis: {
      rpc: allRpc,
    },
  };

  console.log(
    "netowkr.json",
    data,
    "registry",
    chainData,
    "newchain data",
    newChainData
  );

  const getChainInfo = () => {
    return {
      prettyName: data.prettyName || chainData.pretty_name,
      chainId: data.chainId || chainData.chain_id,
      prefix: data.prefix || chainData.bech32_prefix,
      slip44: data.slip44 || chainData.slip44 || 118,
    };
  };

  const getTokenInfo = () => {
    const asset = tokenData.assets[0];
    const base = asset.denom_units.find((el) => el.denom === asset.base);
    const token = asset.denom_units.find((el) => el.denom === asset.display);
    return {
      denom: data.denom || base.denom,
      symbol: data.symbol || token.denom,
      decimals: data.decimals || token.exponent || 6,
      image:
        data.image ||
        (asset.logo_URIs && (asset.logo_URIs.png || asset.logo_URIs.svg)),
      coinGeckoId: asset.coingecko_id,
    };
  };

  const { prettyName, chainId, prefix, slip44 } = getChainInfo();

  const { denom, symbol, decimals, image, coinGeckoId } = getTokenInfo();

  return {
    prettyName,
    chainId,
    prefix,
    slip44,
    denom,
    symbol,
    decimals,
    image,
    coinGeckoId,
    chainData: newChainData,
    tokenData,
  };
};

export default Chain;
