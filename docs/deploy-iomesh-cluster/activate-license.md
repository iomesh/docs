---
id: activate-license
title: Activate License
sidebar_label: Activate License
---

IOMesh currently offers two editions: Community and Enterprise. They differ in the maximum number of worker nodes and level of business support provided. You can find more information on IOMesh official website at https://www.iomesh.com/spec.

IOMesh comes with a trial license when it is installed and deployed. However, it is recommended that you update the trial license to a subscription or perpetual license based on your edition of IOMesh and how long you plan to use it.

- **Community**: Update the license from `Trial` to `Perpetual`. Apply for the perpetual license code at https://www.iomesh.com/license.
- **Enterprise**: Get the license code either of a subscription or perpetual license from SmartX sales and update the license as instructed below.

**Procedure**

1. Get the license code and save it in a file `license-code.txt`.

2. Create a Kubernetes Secret.

    ```bash
    kubectl create secret generic iomesh-authorization-code -n iomesh-system --from-file=authorizationCode=./license-code.txt
    ```
3. Add the field `spec.licenseSecretName` or update it if it exists. Fill in the value `iomesh-authorization-code`, which is the Kubernetes Secret name created above.

    ```bash
    kubectl edit iomesh -n iomesh-system
    ```

    ```output
    spec:
    licenseSecretName: iomesh-authorization-code
    ```

4. Confirm the update, and whether the update is successful will be shown in the output. 

    ```bash
    kubectl describe iomesh -n iomesh-system # Whether the update is successful will be displayed in the events.
    ```
    If the update fails, verify if you have entered the correct license code. If it still does not work, reset the field `spec.licenseSecretName`.

5. Verify that the license expiration date and other details are as expected.

    ```bash
    kubectl get iomesh -n iomesh-system -o=jsonpath='{.items[0].status.license}'
    ```


