---
id: upgrade-cluster
title: Upgrade Cluster  
sidebar_label: Upgrade Cluster
---

You have the option to upgrade the IOMesh cluster either online or offline. Before proceeding, consider the following:
- Upgrade is not supported if the Kubernetes cluster has only one meta pod or one chunk pod.
- Due to the limitations of the Kubernetes CRD upgrade mechanism, the IOMesh cluster upgraded to this release from 0.11.1 cannot run on the Kubernetes cluster of version 1.25 or above.

> _NOTE:_ There might be temporary I/O latency fluctuations during the upgrade. If there is recover or migration data during the cluster upgrade process, the operator will automatically wait for it to end before performing the upgrade action.

## Upgrade from 0.11.1 to 1.0.1

<!--DOCUSAURUS_CODE_TABS-->
<!--Online Upgrade-->

1. Delete the default StorageClass. 

    This release of IOMesh has a different default StorageClass with updated parameters compared to the previous version. You just need to delete the old one and any PVC using it will not be impacted.

    ```shell
    kubectl delete sc iomesh-csi-driver
    ```
2. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Install the CRD of IOMesh 1.0.1. 

    ```shell
    kubectl apply -f https://iomesh.run/config/crd/iomesh.com_blockdevicemonitors.yaml
    ```
4. Get the new fields and values added in IOMesh 1.0.1.
    ```shell
    wget https://iomesh.run/config/merge-values/v1.0.1.yaml -O merge-values.yaml
    ```
5. Edit the YAML file `merge-values.yaml`. Set the value of the `iomesh.edition` field to match the edition specified for the previous version of IOMesh.
    ```yaml
    iomesh:
      # Specify the IOMesh edition, including "enterprise" and "community". If left blank, the community edition will be installed.
      edition: ""
    ```
6. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.1  --reuse-values -f merge-values.yaml
    ```
7. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```

<!--Offline Upgrade-->
1. Delete the default StorageClass. 

    This release of IOMesh has a different default StorageClass with updated parameters compared to the previous version. You just need to delete the old one and any PVC using it will not be impacted.

    ```shell
    kubectl delete sc iomesh-csi-driver
    ```

2. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Download [IOMesh Offline Installation Package](../appendices/downloads) on each worker node and the master node. Then run the following command to unpack the installation package on each worker node and the master node. 

   Make sure to replace `<VERSION>` with `v1.0.1` and  `<ARCH>` based on your CPU architecture. Then refer to [Custom Offline Installation](../deploy-iomesh-cluster/install-iomesh.md#custom-offline-installation) to load the IOMesh image on each worker node and the master node.
   - Hygon x86_64: `hygon-amd64` 
   - Intel x86_64: `amd64`  
   - Kunpeng AArch64: `arm64` 

    ```shell
    tar -xf  iomesh-offline-<VERSION>-<ARCH>.tgz && cd iomesh-offline
    ```
4. Install the CRD of IOMesh 1.0.1.

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

## Upgrade from 1.0.0 to 1.0.1
<!--DOCUSAURUS_CODE_TABS-->
<!--Online Upgrade-->

1. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```

2. Upgrade the IOMesh cluster, which will keep existing fields and values. Then wait for a few minutes till all pods are running.

    ```bash
    helm upgrade --namespace iomesh-system iomesh iomesh/iomesh --version v1.0.1  --reuse-values -f merge-values.yaml
    ```

3. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```

<!--Offline Upgrade-->
1. Temporarily disable IOMesh Webhook to avoid upgrade failure. Once the upgrade is successful, it will be automatically enabled again.

    ```shell
    kubectl delete Validatingwebhookconfigurations iomesh-validating-webhook-configuration
    ```
3. Download [IOMesh Offline Installation Package](../appendices/downloads) on each worker node and the master node. Then run the following command to unpack the installation package on each worker node and the master node. 

   Make sure to replace `<VERSION>` with `v1.0.1` and  `<ARCH>` based on your CPU architecture. Then refer to [Custom Offline Installation](../deploy-iomesh-cluster/install-iomesh.md#custom-offline-installation) to load the IOMesh image on each worker node and the master node.
   
   - Hygon x86_64: `hygon-amd64` 
   - Intel x86_64: `amd64`  
   - Kunpeng AArch64: `arm64` 

    ```shell
    tar -xf  iomesh-offline-<VERSION>-<ARCH>.tgz && cd iomesh-offline
    ```

3. Upgrade the IOMesh cluster, which will merge new fields and values while keeping existing ones. Then wait for a few minutes till all pods are running.

    ```bash
    ./helm upgrade --namespace iomesh-system iomesh ./charts/iomesh --reuse-values -f ./configs/merge-values.yaml
    ```

4. Verify that all pods are in the `Running` state. If so, then IOMesh has been successfully upgraded.
    ```bash
    watch kubectl get pod --namespace iomesh-system
    ```
<!--END_DOCUSAURUS_CODE_TABS-->
