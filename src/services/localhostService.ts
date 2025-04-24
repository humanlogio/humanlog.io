import { CallbacksType, handleError } from "@/lib/utils/errorHandler";
import { Client } from "@connectrpc/connect";
import { LocalhostService } from "api/js/svc/localhost/v1/service_connect";
import { GetConfigResponse } from "api/js/svc/localhost/v1/service_pb";
import { LocalhostConfig } from "api/js/types/v1/localhost_config_pb";

export type LocalhostClientType = Client<typeof LocalhostService>;

export const defaultConfig: LocalhostConfig = new LocalhostConfig({
  version: BigInt(2),
  formatter: {
    themes: {
      light: {
        key: {
          foreground: {
            htmlHexColor: "#146e23",
          },
        },
        value: {
          foreground: {
            htmlHexColor: "#878376",
          },
        },
        time: {
          foreground: {
            htmlHexColor: "#565454",
          },
        },
        msg: {
          foreground: {
            htmlHexColor: "#000000",
          },
        },
        levels: {
          debug: {
            foreground: {
              htmlHexColor: "#d33682",
            },
          },
          info: {
            foreground: {
              htmlHexColor: "#2aa198",
            },
          },
          warn: {
            foreground: {
              htmlHexColor: "#ff8800",
            },
          },
          error: {
            foreground: {
              htmlHexColor: "#d82626",
            },
          },
          panic: {
            foreground: {
              htmlHexColor: "#d82626",
            },
            background: {
              htmlHexColor: "#ffffff",
            },
          },
          fatal: {
            foreground: {
              htmlHexColor: "#d82626",
            },
            background: {
              htmlHexColor: "#ffff00",
            },
          },
          unknown: {
            foreground: {
              htmlHexColor: "#a9a9a9",
            },
          },
        },
      },
      dark: {
        key: {
          foreground: {
            htmlHexColor: "#48df61",
          },
        },
        value: {
          foreground: {
            htmlHexColor: "#8c887c",
          },
        },
        time: {
          foreground: {
            htmlHexColor: "#9e9e9e",
          },
        },
        msg: {
          foreground: {
            htmlHexColor: "#ffffff",
          },
        },
        levels: {
          debug: {
            foreground: {
              htmlHexColor: "#d33682",
            },
          },
          info: {
            foreground: {
              htmlHexColor: "#2aa198",
            },
          },
          warn: {
            foreground: {
              htmlHexColor: "#ff8800",
            },
          },
          error: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
          },
          panic: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
            background: {
              htmlHexColor: "#ffffff",
            },
          },
          fatal: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
            background: {
              htmlHexColor: "#ffff00",
            },
          },
          unknown: {
            foreground: {
              htmlHexColor: "#a9a9a9",
            },
          },
        },
      },
    },
    time: {
      format: "Jan _2 15:04:05.000",
    },
  },
});

export const getConfig = async (
  localhostCleint: LocalhostClientType,
  callbacks?: CallbacksType<GetConfigResponse>,
) => {
  try {
    const res = await localhostCleint.getConfig({});
    callbacks?.onSuccess?.(res);
  } catch (error) {
    handleError<GetConfigResponse>(error, callbacks);
  }
};
