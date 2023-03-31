---
id: upgrade-cluster
title: Upgrade IOMesh Cluster
sidebar_label: Upgrade IOMesh Cluster
---

> Note: You cannot upgrade the IOMesh cluster if it only has one meta Pod and chunk Pod.

> Note: Due to the limitations of the Kubernetes CRD upgrade mechanism, the IOMesh cluster upgraded to this version from version 0.11.1 cannot run on the Kubernetes cluster of version 1.25 or above.

**Procedure**

1. Delete the default StorageClass. 

    The new version of IOMesh 1.0 has a different default StorageClass with updated parameters compared to the previous version. You just need to delete the old one and any PVC using it will not be impacted.

    ```shell
    kubectl delete sc iomesh-csi-driver
    ```
2. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be reinstalled automatically.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Install the CRD of IOMesh 1.0.

    ```shell
    kubectl apply -f https://iomesh.run/config/crd/iomesh.com_blockdevicemonitors.yaml
    ```
4. Upgrade the IOMesh cluster. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.0
    ```
5. Verify that all pods are ready. If all pods are shown as `Running`, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```
