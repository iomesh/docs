---
id: upgrade-cluster
title: Upgrade Cluster  
sidebar_label: Upgrade Cluster
---

You have the option to upgrade the IOMesh cluster from version 0.11.1 to 1.0.0 either online or offline. Before proceeding, consider the following:
- Upgrade is not supported if the Kubernetes cluster has only one meta pod or one chunk pod.
- Due to the limitations of the Kubernetes CRD upgrade mechanism, the IOMesh cluster upgraded to 1.0.0 from 0.11.1 cannot run on the Kubernetes cluster of version 1.25 or above.

**Procedure**
<!--DOCUSAURUS_CODE_TABS-->
<!--Online Upgrade-->

1. Delete the default StorageClass. 

    IOMesh 1.0 has a different default StorageClass with updated parameters compared to the previous version. You just need to delete the old one and any PVC using it will not be impacted.

    ```shell
    kubectl delete sc iomesh-csi-driver
    ```
2. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Install the CRD of IOMesh 1.0.0. 

    ```shell
    kubectl apply -f https://iomesh.run/config/crd/iomesh.com_blockdevicemonitors.yaml
    ```
4. Get the new fields and values added in IOMesh 1.0.0.
    ```shell
    wget https://iomesh.run/config/merge-values/v1.0.0.yaml -O merge-values.yaml
    ```
5. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.0
    ```
5. Verify that all pods are running. If all pods are shown as `Running`, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```

<!--Offline Upgrade-->
1. Delete the default StorageClass. 

    IOMesh 1.0.0 has a different default StorageClass with updated parameters compared to the previous version. You just need to delete the old one and any PVC using it will not be impacted.

    ```shell
    kubectl delete sc iomesh-csi-driver
    ```

2. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Install the CRD of IOMesh 1.0.0.

    ```shell
    kubectl apply -f https://iomesh.run/config/crd/iomesh.com_blockdevicemonitors.yaml
    ```
4. Download [IOMesh Offline Installation Package](https://download.smartx.com/iomesh-offline-v0.11.1.tgz).

5. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.0
    ```
6. Verify that all pods are running. If all pods are shown as `Running`, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```
<!--END_DOCUSAURUS_CODE_TABS-->
