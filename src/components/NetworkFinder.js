import _ from "lodash";
import axios from "axios";
import React, { useEffect, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Network from "../utils/Network.mjs";
import { overrideNetworks } from "../utils/Helpers.mjs";
import NewApp from "./NewApp";

import { Spinner } from "react-bootstrap";

import networksData from "../networks.json";

function NetworkFinder() {
  const params = useParams();
  const navigate = useNavigate();

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { loading: true, networks: [] }
  );

  const getNetworks = async () => {
    const registryNetworks = await axios
      .get("https://registry.cosmos.directory")
      .then((res) => res.data)
      .then((data) => data.reduce((a, v) => ({ ...a, [v.directory]: v }), {}));

    const networks = networksData
      .filter((el) => el.enabled !== false)
      .map((data) => {
        const registryData = registryNetworks[data.name] || {};
        return { ...registryData, ...data };
      });
    return _.compact(networks).reduce((a, v) => ({ ...a, [v.name]: v }), {});
  };

  const changeNetwork = (network) => {
    setState({
      network: network,
    });
  };

  useEffect(() => {
    if (!Object.keys(state.networks).length) {
      setState({ loading: true });
      getNetworks().then((networks) => {
        setState({ networks: networks, loading: false });
      });
    }
  }, [state.networks]);

  useEffect(() => {
    if (Object.keys(state.networks).length && !state.network) {
      const networkName = params.network || Object.keys(state.networks)[0];
      const data = state.networks[networkName];
      if (params.network && !data) {
        navigate("/" + Object.keys(state.networks)[0]);
      }
      if (!data) {
        setState({ loading: false });
        return;
      }
      if (!params.network) {
        navigate("/" + networkName);
      }
      Network(data).then((network) => {
        setState({ network: network });
      });
    }
  }, [state.networks, state.network, params.network, navigate]);

  if (state.loading) {
    return (
      <div className="pt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (state.error) {
    return <p>Loading failed</p>;
  }

  if (!state.network) {
    return <p>Page not found</p>;
  }

  return (
    <NewApp
      networks={state.networks}
      network={state.network}
      changeNetwork={(network, validators) =>
        changeNetwork(network, validators)
      }
    />
  );
}

export default NetworkFinder;
