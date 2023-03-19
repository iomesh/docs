---
id: create-storageclass
title: Creating StorageClass
sidebar_label: Creating StorageClass
---

The best practice of using PV and PVC is to have a StorageClass that describes the class and attributes of persistent volumes. IOMesh provides a default StorageClass `iomesh-csi-driver` that provides persistent volumes for pods through Dynamic Volume Provisioning. It is created when IOMesh is installed and cannot be modified afterward. If you want a StorageClass with custom parameters, refer to the following.

| Parameter| Available Value| Default Value (`iomesh-csi-driver`)| Description|
|---|---|---|---|
|`provisioner`| |  |
|`reclaimPolicy`|"retain" or "delete"| "delete"|
|`allowVolumeExpansion`|"true" or "false| "true"| Shows if volume expansion support is enabled.|
|`csi.storage.k8s.io/fstype`|"xfs", "ext2", "ext3", "ext4"|"ext4"|The file system type.|
|`replicaFactor` | "2", "3" | "2" | The number of replicas.      
| `thinProvision` | "true", "false" | "true"  | The provisioning type: "true" for thin provisioning or "false" for thick provisioning. |

**Procedure**

1. Create a YAML file and configure its parameters.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-csi-driver-default
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Retain # Specify the retention policy.
    allowVolumeExpansion: true # set it to "true" if you want to expand volume capacity.
    parameters:
      # Specify the file system type, including "ext4", "ext3", "ext2", and "xfs".
      csi.storage.k8s.io/fstype: "ext4"
      # Specify the replication factor from "2" or "3".
      replicaFactor: "2"
      # Specify the provisioning type.
      thinProvision: "true"
    volumeBindingMode: Immediate
    ```

2. Run the following command to apply the YAML file.

    ```
    kubectl apply -f sc.yaml
    ```

3. Run the following command to view the newly created StorageClass.

    ```
    kubectl get -f sc.yaml # 需要确认命令
    ```
  
