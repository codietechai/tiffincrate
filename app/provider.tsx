"use client";
import React from "react";
import { persistor, store } from "../store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { APIProvider } from "@vis.gl/react-google-maps";

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <APIProvider
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
        >
          {children}
        </APIProvider>
      </PersistGate>
    </Provider>
  );
};

export default RootProvider;
