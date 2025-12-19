// import { render } from '@testing-library/react';
// import configureMockStore from 'redux-mock-store';
// import KeycloakUi from './ui-keycloak';
// import { Provider } from 'react-redux';

// export const config = {
//   KEYCLOAK_URL: 'https://intgtestweb.pdc.local:8000/auth/',
//   KEYCLOAK_REALM: 'cloudcents',
//   KEYCLOAK_CLIENT_ID: 'frontend',
//   KEYCLOAK_SCOPE: 'profile',
// };
// const createMockStore = configureMockStore([]);

// describe('KeycloakUi', () => {
//   it('should render successfully', () => {
//     const mockStore = createMockStore({ keycloakUi: {} });

//     const { baseElement } = render(
//       <Provider store={mockStore}>
//         <KeycloakUi
//           url={config.KEYCLOAK_URL}
//           realm={config.KEYCLOAK_REALM}
//           clientId={config.KEYCLOAK_CLIENT_ID}
//           scope={config.KEYCLOAK_SCOPE}
//         />
//       </Provider>,
//     );
//     expect(baseElement).toBeTruthy();
//   });
// });
