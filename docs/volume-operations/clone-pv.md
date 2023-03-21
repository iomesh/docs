---
id: clone-pv
title: Cloning PV
sidebar_label: Cloning PV
---

A clone is a duplicate of an existing volume in the system and data on the source will be duplicated to the destination. To clone a PV, you should create a new PVC and specify an existing PVC in the field `dataSource` so that you can clone a volume based on it.

**Precautions**
- The source PVC and the destination PVC must be in the same namespace.
- The source PVC and the destination PVC must have the same StorageClass and VolumeMode configurations.
- The capacity value must be the same or larger than that of the source PVC.

**Prerequisite**

Verify that there is already a PVC available for cloning.

**Procedure**
1. Create a YAML config `example-clone.yaml`. Specify the source PVC you want to clone.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: cloned-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      dataSource:
        name: existing-pvc # Specify the source PVC in the same namespace. 
        kind: PersistentVolumeClaim
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5Gi # The capacity value must be the same or larger than that of the source volume.
      volumeMode: Block
    ```
克隆的

2. Run the following command to apply the YAML file. Once done, a clone of `existing-pvc` will be created.

    ```bash
    kubectl apply -f example-clone.yaml
    ```
   
   
   After running the command，要有一个 example（或者加一个查看命令）

