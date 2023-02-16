---
id: setup-storageclass
title: Setup StorageClass
sidebar_label: Setup StorageClass
---

## Creating StorageClass

The best practice to use PV and PVC is to create a StorageClass that describes 



使用 PV 和 PVC 的最佳实践，是你要创建一个 StorageClass 来描述这个 PV

StorageClass describes storage type and are used for PVC

storageclass 是什么，在 IOMesh 能干什么，如何使用/配置
Storage Classes have parameters that describe volumes belonging to the storage class, and are used for PVC. 

### Configuring `iomesh-csi-driver`

`iomesh-csi-driver` is a volume plug-in running in the Kubernetes cluster and is used for provisioning persistent volumes of IOMesh. When IOMesh is installed, `iomesh-csi-driver` as a default StorageClass will be created. You can configure its parameters as below. Note that it cannot be modified once you have complete the configuration.

| Parameter| Available Values| Default | Description|
| ----- | ----- | ------- | ---------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | File system type            |
| replicaFactor             | "2", "3"                      | "2"     | replica factor                     |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision. |



### Creating a StorageClass

If none of StorageClasses meet usage requirements, you can create a new one and specify its parameters.

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: iomesh-csi-driver-default
provisioner: com.iomesh.csi-driver # <-- driver.name in iomesh-values.yaml
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  # "ext4" / "ext3" / "ext2" / "xfs"
  csi.storage.k8s.io/fstype: "ext4"
  # "2" / "3"
  replicaFactor: "2"
  # "true" / "false"
  thinProvision: "true"
volumeBindingMode: Immediate
```

> _About the `reclaimPolicy`_
> 
> The `reclaimPolicy` attribute of `StorageClass` can have two values of `Retain` and `Delete`, and the default is `Delete`. When a `PV` is created through `StorageClass`, its `persistentVolumeReclaimPolicy` attribute will inherit the `reclaimpolicy` attribute from `StorageClass`. You can also modify the value of `persistentVolumeReclaimPolicy` manually.
> 
> The value of `reclaimPolicy` in the example is `Retain`, which means that, if you delete a `PVC`, the `PV` under the `PVC` will not be deleted, but will enter the `Released` state. Please note that, if you delete the `PV`, the corresponding IOMesh volume will not be deleted, instead, you need to change the value of `persistentVolumeReclaimPolicy` of the `PV` to `Delete` and then delete the `PV`. Or before creating a `PV`, you can set the value of `reclaimpolicy` of `StorageClass`  to `Delete` so that all the resources will be released in cascade.
