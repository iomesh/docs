---
id: manage-license
title: Update License
sidebar_label: Update License
---

IOMesh currently offers two editions: Community and Enterprise. They differ in the maximum number of worker nodes and level of business support provided. You can find more information on IOMesh official website at https://www.iomesh.com/spec.

## View License Information

To view license information, run the following command:
```shell
kubectl get iomesh -n iomesh-system -o=jsonpath='{.items[0].status.license}'
```

See details in the following table:
|License Information|Description|
|---|---|
|`Expiration Date`|The date when the license expires.|
|`License Type`|<ul><li>Trial: Automatically generated after deploying IOMesh and remains valid for 30 days by default.</li><li>Subscription: Set your own subscription period, with a minimum of 1 year.</li><li>Perpetual: Permanently valid.</li></ul>|
|`Max Chunk Num`|The maximum number of worker nodes to deploy IOMesh.|
|`Max Physical Data Capacity`| The maximum capacity of the IOMesh cluster, and 0 means no limit.|
|`Max Physical Data Capacity Per Node`|The maximum capacity of each node in the IOMesh cluster, and 0 means no limit.| 
|`Serial`|The serial number of the IOMesh cluster.|
|`Sign Date`|The date when the license is issued.|
|`Software Edition`|IOMesh edition, including Community and Enterprise.|
|`Subscription Expiration Date`|The date when the subscription license expires.|
|`Subscription Start Date`|The date when the subscription license becomes effective.|

## Update License

Update the license in the following scenarios:

- Activate the license after installing IOMesh, which is already explained in [Activate License]().
- Increase the number of nodes when the current node quota cannot meet requirements.
- Extend the validity period of a trial license or subscription license.

**Prerequisites**

- Community Edition: Apply for the new license code at https://www.iomesh.com/license.
- Enterprise Edition: Contact SmartX sales for the new license code. 

**Procedure**

1. Delete the old Kubernetes Secret and the `spec.licenseSecretName` field in `iomesh` object.

    ```bash
    kubectl delete secret iomesh-authorization-code -n iomesh-system
    ```

    ```bash
    kubectl edit iomesh -n iomesh-system
    ```
    ```output
    spec:
    licenseSecretName: iomesh-authorization-code # Delete this line.
    ```

2. Create a file `license-code.txt` and save the new license code in it.

3. Create a Kubernetes Secret.

    ```bash
    kubectl create secret generic iomesh-authorization-code -n iomesh-system --from-file=authorizationCode=./license-code.txt
    ```

3. Add the field `spec.licenseSecretName` . Fill in the value `iomesh-authorization-code`, which is the Kubernetes Secret name created above.

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







