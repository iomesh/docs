---
id: setup-k8s-cluster-storage
title: Setup k8s Cluster Storage
sidebar_label: Setup k8s Cluster Storage
---

## Setup a StorageClass

StorageClass have parameters that define IOMesh volume properties.

| Parameters                | Values                        | Default | Description                        |
| ------------------------- | ----------------------------- | ------- | ---------------------------------- |
| csi.storage.k8s.io/fstype | "xfs", "ext2", "ext3", "ext4" | "ext4"  | volume File system type            |
| replicaFactor             | "1", "2", "3"                 | "2"     | replica factor                     |
| thinProvision             | "true", "false"               | "true"  | thin provision or thick provision. |

After IOMesh CSI driver is installed, a default StorageClass `iomesh-csi-driver-default` would be created. You may also create a new StorageClass with customized parameters.


```yaml
# storageclass.yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: my-iomesh-csi-driver-default
# driver.name in values.yaml
provisioner: com.iomesh.csi-driver
# Delete / Retain
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

```shell
kubectl apply -f storageclass.yaml
```

## Setup SnapshotClass

Just like StorageClass provides a way for administrators to describe the "classes" of storage they offer when provisioning a volume, VolumeSnapshotClass provides a way to describe the "classes" of storage when provisioning a volume snapshot.

> **_Note:_ Only for `Kubernetes >= v1.13.0` or `Openshift >= v4.0`**

```yaml
# snapshotclass.yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshotClass
metadata:
  name: iomesh-csi-driver-default
# driver.name in values.yaml
driver: <dirver.name>
# Delete / Retain
deletionPolicy: Retain
```

```shell
kubectl apply -f snapshotclass.yaml
```
