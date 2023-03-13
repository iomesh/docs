---
id: setup-storageclass
title: Setup StorageClass
sidebar_label: Setup StorageClass
---

## Creating StorageClass

The best practice of using PV and PVC is to create a StorageClass that describes the class and attributes of persistent volumes. When the installation of IOMesh is completed, `iomesh-csi-driver` will be created at the same time as the default StorageClass and cannot be modified afterward. You can also create a StorageClass with custom configurations.

### Viewing Default StorageClass

`iomesh-csi-driver` is a volume plug-in running in the Kubernetes cluster and is used for provisioning IOMesh persistent volumes. It is created as the default StorageClass when IOMesh is installed and cannot be configured once created.

| Parameter| Default Value | Description|
| ----- | ----- | ---------- |
| csi.storage.k8s.io/fstype | "ext4"  | The file system type.  |
| replicaFactor             |"2"     | The number of replicas.                     |
| thinProvision             | "true"  | The provisioning type, |

### Creating StorageClass

If none of StorageClasses meet usage requirements, you can create a new one and specify its parameters. Refer to the following for parameters available for modification.

| Parameter| Available Values| Default Value | Description|
| ----- | ----- | ------- | ---------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | The file system type.           |
| replicaFactor             | "2", "3"                      | "2"     | The number of replicas.                    |
| thinProvision             | "true", "false"               | "true"  | The provisioning type. |

**Procedure**

1. Create a YAML file and configure its parameters.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: iomesh-csi-driver-default
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      # "ext4" / "ext3" / "ext2" / "xfs" # Specify the file system type.
      csi.storage.k8s.io/fstype: "ext4"
      # "2" / "3"
      replicaFactor: "2"
      # "true" / "false"
      thinProvision: "true"
    volumeBindingMode: Immediate
    ```

    > _About `reclaimPolicy`_
    > 
    > The `reclaimPolicy` field of `StorageClass` can have two values, `Retain` and `Delete`, and the default is Delete. When a `PV` is created through a StorageClass, its `persistentVolumeReclaimPolicy` will inherit the original `reclaimpolicy` value from the StorageClass. You can also modify this value. 
    > 
    > The value of `reclaimPolicy` in the example is `Retain`, which means that, if you delete a `PVC`, the `PV` under the `PVC` will not be deleted, but will enter the `Released` state. Please note that, if you delete the `PV`, the corresponding IOMesh volume will not be deleted, instead, you need to change the value of `persistentVolumeReclaimPolicy` of the `PV` to `Delete` and then delete the `PV`. Or before creating a `PV`, you can set the value of `reclaimpolicy` of `StorageClass`  to `Delete` so that all the resources will be released in cascade.

2. Run the command to apply the YAML file.

```
kubectl apply -f sc.yaml
```
  
