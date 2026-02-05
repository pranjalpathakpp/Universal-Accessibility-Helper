// Chrome Extension API type declarations
declare namespace chrome {
  namespace runtime {
    function sendMessage<T = unknown>(message: unknown, callback?: (response: T) => void): void;
    const onMessage: {
      addListener(callback: (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => boolean | void): void;
    };
    const onInstalled: {
      addListener(callback: (details: { reason: string }) => void): void;
    };
    const lastError: { message?: string } | undefined;
  }

  namespace storage {
    namespace sync {
      function get(keys: string | string[] | { [key: string]: any } | null, callback: (items: { [key: string]: any }) => void): void;
      function set(items: { [key: string]: any }, callback?: () => void): void;
    }
    namespace local {
      function get(keys: string | string[] | { [key: string]: any } | null, callback: (items: { [key: string]: any }) => void): void;
      function set(items: { [key: string]: any }, callback?: () => void): void;
    }
  }

  namespace tabs {
    function query(queryInfo: any, callback: (result: Tab[]) => void): void;
    function create(createProperties: { url: string }, callback?: (tab: Tab) => void): void;
    function sendMessage(tabId: number, message: any, callback?: (response: any) => void): Promise<any>;
    
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active?: boolean;
      currentWindow?: boolean;
    }
  }

  namespace action {
    const onClicked: {
      addListener(callback: (tab: chrome.tabs.Tab) => void): void;
    };
  }
}
