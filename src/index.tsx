import { getChainOptions, WalletProvider } from '@terra-money/wallet-provider';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import ReactDOM from 'react-dom';

import Nav from 'components/Nav/Nav';
import TinyBalances from 'components/TinyBalances/TinyBalances';
import TinyRewards from 'components/TinyRewards/TinyRewards';

import './style.css';

function App() {
  const queryClient = new QueryClient();

  return (
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
        <main id="app">
          <Nav/>
          <TinyBalances/>
          <TinyRewards/>
        </main>
        </QueryClientProvider>
      </ChakraProvider>
  );
}

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <App />
    </WalletProvider>,
    document.getElementById('root'),
  );
});
