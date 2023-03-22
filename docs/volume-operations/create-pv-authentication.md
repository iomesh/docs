---
id: create-pv-authentication
title: Create PV with authentication
sidebar_label: Create PV with authentication
---

You can create a PV with authentication and save the authentication information and user credentials in the Kubernetes secret. You must provide the correct credentials to access a PV with authentication.

This authentication is achieved by configuring a Secret for the StorageClass, and each StorageClass has a separate authentication information. Whenever a user wants to use the StorageClass, the Secret of the StorageClass needs to be configured in the PVC, and the PVC can only be used by the Pod if the data of the two Secrets match exactly.