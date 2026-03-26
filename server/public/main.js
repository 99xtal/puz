import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from '../src/react/app'

hydrateRoot(document, React.createElement(App));