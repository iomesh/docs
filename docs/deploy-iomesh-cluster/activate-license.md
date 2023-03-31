---
id: activate-license
title: Activate License
sidebar_label: Activate License
---

IOMesh is installed and deployed with a trial license. You should update the trial license to a subscription or perpetual license, which depends on your IOMesh edition and how long you want to use it.

IOMesh currently provides Community and Enterprise editions, which are slightly different in the maximum number of worker nodes and bussiness support. See [the IOMesh official website](https://www.iomesh.com/spec) for details.  

If you choose Community Edition, you should update the trial license to perpetual license which can be applied for free at [the IOMesh official website](https://www.iomesh.com/license).

If you choose Enterprise Edition, get the license code either for subscription or perpetual from SmartX sales and update the license as instructed below.

**Procedure**

1. Save the license code in a file `license.code.txt`.

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


