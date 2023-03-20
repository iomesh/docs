---
id: create-storageclass
title: Creating StorageClass
sidebar_label: Creating StorageClass
---

IOMesh provides a default StorageClass `iomesh-csi-driver` that provides PVs for pods through dynamic volume provisioning. Its parameters adopt the default values in the table below and cannot be modified. If you want a StorageClass with custom parameters, refer to the following.

| Parameter|Description|Default (`iomesh-csi-driver`)|
|---|---|---|
|`provisioner`| The provisioner that determines what volume plugin is used for provisioning PVs. |`com.iomesh.csi-driver`|
|`reclaimPolicy`|<p>The reclaim policy for dynamically provisioned PVs, either `retain` or `delete`.</p> 注意事项: 子银会给一版新的内容。|`delete`|
|`allowVolumeExpansion`|Shows if volume expansion support is enabled.| `true`|
|`csi.storage.k8s.io/fstype`|The filesystem type, including "xfs", "ext2", "ext3", "ext4"|`ext4`|
|`replicaFactor` | The number of replicas for PVs, including 2 or 3.|`2`|   
| `thinProvision` | Shows the provisioning type, "true" for thin provisioning or "false" for thick provisioning. |`true`|


**Procedure**

1. Create a StorageClass `sc.yaml` and configure its parameters.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-csi-driver-default
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Delete # 根据子银最新内容增加指示。
    allowVolumeExpansion: true 
    parameters:
      # Specify the file system type, including "ext4", "ext3", "ext2", and "xfs".
      csi.storage.k8s.io/fstype: "ext4"
      # Specify the replication factor, either "2" or "3".
      replicaFactor: "2"
      # Specify the provisioning type.
      thinProvision: "true"
    volumeBindingMode: Immediate
    ```

2. Run the following command to apply the YAML file.

    ```
    kubectl apply -f sc.yaml # 文件名需要确认
    ```

3. Run the following command to view the newly created StorageClass.

    ```
    kubectl get storageclass 你的storageclass的name
    ```
  
