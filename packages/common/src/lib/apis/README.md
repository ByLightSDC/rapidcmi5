# Creating new APIs

When creating an API integration within Rapid CMI5 we use ts-rest
in order to have a contract in place between a frontend and backend.

https://ts-rest.com/

This contract is driven by the rapid cmi5 library and must allow versioning to take place.

Any breaking changes to these contracts will result in a version bump, which is simply an integer that starts at 1 and increases with every change to the contract.

These changes should be kept to an absolute minimum when possible.

