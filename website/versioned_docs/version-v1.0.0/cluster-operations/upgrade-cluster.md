---
id: version-v1.0.0-upgrade-cluster
title: Upgrade Cluster
sidebar_label: Upgrade Cluster
original_id: upgrade-cluster
---

You have the option to upgrade the IOMesh cluster from version 0.11.1 to 1.0.0 either online or offline. Before proceeding, consider the following:
- Upgrade is not supported if the Kubernetes cluster has only 1 meta pod or 1 chunk pod.
- Due to the limitations of the Kubernetes CRD upgrade mechanism, the IOMesh cluster upgraded to 1.0.0 from 0.11.1 cannot run on the Kubernetes cluster of version 1.25 or above.

> _NOTE:_
> There might be temporary I/O latency fluctuations during the upgrade.

**Procedure**
<!--DOCUSAURUS_CODE_TABS-->
<!--Online Upgrade-->

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
4. Get the new fields and values added in IOMesh 1.0.0.
    ```shell
    wget https://iomesh.run/config/merge-values/v1.0.0.yaml -O merge-values.yaml
    ```
5. Edit the YAML file `merge-values.yaml`. Set the value of the `iomesh.edition` field to match the edition specified for the previous version of IOMesh.
    ```yaml
    iomesh:
      # Specify the IOMesh edition, including "enterprise" and "community". If left blank, the community edition will be installed.
      edition: ""
    ```
6. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.0  --reuse-values -f merge-values.yaml
    ```

7. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully upgraded.
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
3. Download [IOMesh Offline Installation Package](../appendices/downloads). Make sure to replace `<VERSION>` with `v1.0.0` and  `<ARCH>` based on your CPU architecture.
   - Hygon x86_64: `hygon-amd64` 
   - Intel x86_64: `amd64`  
   - Kunpeng AArch64: `arm64` 

    ```shell
    tar -xf  iomesh-offline-<VERSION>-<ARCH>.tgz && cd iomesh-offline
    ```
4. Install the CRD of IOMesh 1.0.0.

    ```shell
    kubectl apply -f ./configs/iomesh.com_blockdevicemonitors.yaml
    ```

5. Edit the YAML file `merge-values.yaml` located in the directory `iomesh-offline/configs/`. Set the value of the `iomesh.edition` field to match the edition specified for the previous version of IOMesh.
    ```yaml
    iomesh:
      # Specify the IOMesh edition, including "enterprise" and "community". If left blank, the community edition will be installed.
      edition: ""
    ```

6. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    ./helm upgrade --namespace iomesh-system iomesh ./charts/iomesh --reuse-values -f ./configs/merge-values.yaml
    ```

7. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```
<!--END_DOCUSAURUS_CODE_TABS-->
