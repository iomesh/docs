---
id: setup-storageclass
title: Setup StorageClass
sidebar_label: Setup StorageClass
---

The parameters of IOMesh storage class are:

| Parameter                 | Value                         | Default | Description                        |
| ------------------------- | ----------------------------- | ------- | ---------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type            |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                     |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision. |

After IOMesh CSI driver was installed, a default StorageClass `iomesh-csi-driver` would be created. You may also create a new StorageClass with customized parameters:


```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: my-iomesh-csi-driver-default
provisioner: com.iomesh.csi-driver # <-- driver.name in iomesh-values.yaml
reclaimPolicy: Retain
allowVolumeExpansion: true
parameters:
  # "ext4" / "ext3" / "ext2" / "xfs"
  csi.storage.k8s.io/fstype: "ext4"
  # "1" / "2" / "3"
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
