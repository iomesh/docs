---
id: activate-license
title: Activate License
sidebar_label: Activate License
---

IOMesh currently offers two editions: Community and Enterprise. They differ in the maximum number of worker nodes and level of business support provided. You can find more information on the IOMesh official website at https://www.iomesh.com/spec.

IOMesh comes with a trial license when it is installed and deployed. However, it is recommended that you update the trial license to a subscription or perpetual license, depending on your IOMesh edition and how long you plan to use it.

**Prerequisites**
- **Community**: Apply for the new license code at https://www.iomesh.com/license.
- **Enterprise**: Get the license code either of a subscription or perpetual license from SmartX sales.

**Procedure**

1. Create a file `license-code.txt` and save the license code in it.

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


