declare module 'react-router' {
  interface AppLoadContext {}

  interface LoaderFunctionArgs {
    context: AppLoadContext
  }

  interface ActionFunctionArgs {
    context: AppLoadContext
  }
}

export {}
