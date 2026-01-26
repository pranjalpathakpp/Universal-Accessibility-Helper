// Chrome Extension API type declarations
declare namespace chrome {
  namespace runtime {
    function sendMessage(message: any, callback?: (response: any) => void): void;
    const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean): void;
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
